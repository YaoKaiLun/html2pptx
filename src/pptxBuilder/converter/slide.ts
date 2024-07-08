import PresentationModel from '../model/presentation';
import SlideModel from '../model/slide';
import { Bounds } from '../../htmlParser/css/layout/bounds';
import { isTransparent } from '../../htmlParser/css/types/color';
import { ElementPaint, StackingContext } from '../../htmlParser/stacking-context';
import { ElementContainer } from '../../htmlParser/dom/element-container';
import { CSSImageType, CSSURLImage } from '../../htmlParser/css/types/image';
import { Context } from '../../core/context';
import { calculateBackgroundRendering } from '../../htmlParser/parse/background';
import { ImageElementContainer } from '../../htmlParser/dom/replaced-elements/image-element-container';
import { TextContainer } from '../../htmlParser/dom/text-container';
import { color2ColorObj } from '../utils/color';

export default class SlideConverter {
  context: Context;
  presentationModel: PresentationModel;
  stackingContext: StackingContext;
  slideModel?: SlideModel;
  slideBounds?: Bounds;

  constructor(context: Context, presentationModel: PresentationModel, stackingContext: StackingContext) {
    this.context = context;
    this.presentationModel = presentationModel;
    this.stackingContext = stackingContext;
  }

  async convert() {
    this.slideModel = new SlideModel();
    this.presentationModel.addSlide(this.slideModel);
    
    this.slideBounds = this.stackingContext.element.container.bounds;
    await this.convertStack(this.stackingContext);
  }

  private async convertStack(stack: StackingContext) {
    const styles = stack.element.container.styles;
    if (styles.isVisible()) {
      await this.convertStackContent(stack);
    }
  }

  private async convertStackContent(stack: StackingContext) {
    // https://www.w3.org/TR/css-position-3/#painting-order

    // 1. the background and borders of the element forming the stacking context.
    await this.convertNodeBackgroundAndBorders(stack.element);

    // 2. the child stacking contexts with negative stack levels (most negative first).
    for (const child of stack.negativeZIndex) {
      this.convertStack(child);
    }

    // 3. For all its in-flow, non-positioned, block-level descendants in tree order:
    await this.convertNodeContent(stack.element);
    for (const child of stack.nonInlineLevel) {
      await this.convertNode(child);
    }

    // 4. All non-positioned floating descendants, in tree order. For each one of these,
    // treat the element as if it created a new stacking context, but any positioned descendants and descendants
    // which actually create a new stacking context should be considered part of the parent stacking context,
    // not this new one.
    for (const child of stack.nonPositionedFloats) {
      await this.convertStack(child);
    }

    // 5. the in-flow, inline-level, non-positioned descendants, including inline tables and inline blocks.
    for (const child of stack.nonPositionedInlineLevel) {
      await this.convertStack(child);
    }

    for (const child of stack.inlineLevel) {
      await this.convertNode(child);
    }

    // 6. All positioned, opacity or transform descendants, in tree order that fall into the following categories:
    //  All positioned descendants with 'z-index: auto' or 'z-index: 0', in tree order.
    //  For those with 'z-index: auto', treat the element as if it created a new stacking context,
    //  but any positioned descendants and descendants which actually create a new stacking context should be
    //  considered part of the parent stacking context, not this new one. For those with 'z-index: 0',
    //  treat the stacking context generated atomically.
    //
    //  All opacity descendants with opacity less than 1
    //
    //  All transform descendants with transform other than none
    for (const child of stack.zeroOrAutoZIndexOrTransformedOrOpacity) {
      await this.convertStack(child);
    }

    // 7. Stacking contexts formed by positioned descendants with z-indices greater than or equal to 1 in z-index
    // order (smallest first) then tree order.
    for (const child of stack.positiveZIndex) {
      await this.convertStack(child);
    }
  }

  private async convertNodeBackgroundAndBorders(paint: ElementPaint): Promise<void> {
    const styles = paint.container.styles;

    const hasBackground = !isTransparent(styles.backgroundColor) || styles.backgroundImage.length;

    if (hasBackground || styles.boxShadow.length) {
      if (!isTransparent(styles.backgroundColor)) {
        const colorObj = color2ColorObj(styles.backgroundColor);
        const bounds = paint.container.bounds;

        this.slideModel!.addElement({
          type: 'shape',
          left: bounds.left - this.slideBounds!.left,
          top: bounds.top - this.slideBounds!.top,
          width: bounds.width,
          height: bounds.height,
          fill: {
            color: colorObj.hex,
            opacity: colorObj.transparency,
          },
        });
      }

      await this.renderBackgroundImage(paint.container);
    }
  }

  private async renderBackgroundImage(container: ElementContainer): Promise<void> {
    let index = container.styles.backgroundImage.length - 1;
    for (const backgroundImage of container.styles.backgroundImage.slice(0).reverse()) {
      if (backgroundImage.type === CSSImageType.URL) {
        let image;
        const url = (backgroundImage as CSSURLImage).url;
        try {
          image = await this.context.cache.match(url);
        } catch (e) {
          this.context.logger.error(`Error loading background-image ${url}`);
        }

        if (image) {
          const [_, x, y, width, height] = calculateBackgroundRendering(container, index, [
            image.width,
            image.height,
            image.width / image.height,
          ]);
          this.slideModel!.addElement({
            type: 'image',
            left: x - this.slideBounds!.left,
            top: y - this.slideBounds!.top,
            width,
            height,
            src: image.src,
          });
        }
      }
      index--;
    }
  }

  private async convertNode(paint: ElementPaint) {
    if (paint.container.styles.isVisible()) {
      await this.convertNodeBackgroundAndBorders(paint);
      await this.convertNodeContent(paint);
    }
  }


  private async convertNodeContent(paint: ElementPaint) {
    const container = paint.container;

    if (container.textNodes.length > 0) {
      this.convertText(container, container.textNodes);
    }

    if (container instanceof ImageElementContainer) {
      await this.convertImage(container);
    }
  }

  private convertText(container: ElementContainer, textContainers: TextContainer[]) {
    const { styles } = container;

    for (const child of textContainers) {
      let text = child.text;
      let bounds = { left: 0, top: 0, width: 0, height: 0 };

      for (let i = 0; i < child.textBounds.length; i++) {
        const textBounds = child.textBounds[i].bounds;

        if (i === 0) {
          bounds.left = textBounds.left - this.slideBounds!.left;
          bounds.top = textBounds.top - this.slideBounds!.top;
        }

        bounds.width += textBounds.width;
        bounds.height = Math.max(textBounds.height, bounds.height);
      }

      this.slideModel!.addElement({
        type: 'text',
        text,
        ...bounds,
        width: Math.ceil(bounds.width) + 16, // hack
        color: color2ColorObj(styles.color).hex,
        fontSize: styles.fontSize.number,
        bold: styles.fontWeight > 400,
        fontFace: styles.fontFamily[0],
      });
    }
  }

  private async convertImage(container: ImageElementContainer) {
    try {
      const image = await this.context.cache.match(container.src);
      const bounds = container.bounds;

      await this.slideModel!.addElement({
        type: 'image',
        left: bounds.left - this.slideBounds!.left,
        top: bounds.top - this.slideBounds!.top,
        width: bounds.width,
        height: bounds.height,
        src: image.src,
      });
    } catch (e) {
      this.context.logger.error(`Error loading image ${container.src}`);
    }
  }
}
