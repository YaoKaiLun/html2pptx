import Pptxgen from 'pptxgenjs';
import { IPresentationModel, ISlideModel } from '../model/types';
import { pixelsToInches } from '../utils/unit';

export function buildPresentation(presentationModel: IPresentationModel) {
  const presentation = new Pptxgen();
  const attrs = presentationModel.attrs;

  const layoutName = `${attrs.width}x${attrs.height}`;
  presentation.defineLayout({
    name: layoutName,
    width: pixelsToInches(attrs.width),
    height: pixelsToInches(attrs.height),
  });
  presentation.layout = layoutName;

  presentationModel.slides.forEach(slide => {
    buildSlide(presentation, slide);
  });

  return presentation;
}

function buildSlide(presentation: Pptxgen, slideModel: ISlideModel) {
  const slide = presentation.addSlide();
  const elements = slideModel.elements;

  elements.forEach(element => {
    const bounds = {
      x: pixelsToInches(element.left),
      y: pixelsToInches(element.top),
      w: pixelsToInches(element.width),
      h: pixelsToInches(element.height),
    };

    if (element.type === 'shape') {
      slide.addShape('rect', {
        ...bounds,
        fill: element.fill ? {
          color: element.fill.color.slice(1),
          transparency: element.fill.opacity,
        } : undefined,
      });
    } else if (element.type === 'image') {
      slide.addImage({
        ...bounds,
        path: element.src,
      });
    } else if (element.type === 'text') {
      console.log('element', element);
      console.log('--bounds--', bounds);

      slide.addText(element.text, {
        ...bounds,
        color: element.color,
        fontSize: (element.fontSize || 16) * 0.75,
        bold: element.bold,
        fontFace: element.fontFace,
        inset: 0,
        charSpacing: 0,
        valign: 'middle',
        fit: 'resize',
      });
    }
  });
}