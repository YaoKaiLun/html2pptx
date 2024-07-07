import { Context } from '../core/context';
import { parseTree } from './dom/node-parser';
import { CloneConfigurations, DocumentCloner } from './dom/document-cloner';
import { parseStackingContexts } from './stacking-context';

export class HtmlParser {
  private context: Context;
  private slideDoms: HTMLElement[];

  constructor(context: Context, slideDoms: HTMLElement[]) {
    if (slideDoms.length < 1) {
      throw new Error('无效的 slideDoms');
    }

    slideDoms.forEach(slideDom => this.checkSlideDomValid(slideDom));

    this.slideDoms = slideDoms;
    this.context = context;
  }

  parse() {
    const cloneOptions: CloneConfigurations = {
      allowTaint: false,
      inlineImages: false,
      copyStyles: true,
    };

    const stackingContexts = this.slideDoms.map(slideDom => {
      const documentCloner = new DocumentCloner(this.context, slideDom, cloneOptions);
      const clonedElement = documentCloner.clonedReferenceElement!;

      // TODO 
      const root = parseTree(this.context, slideDom);
      return parseStackingContexts(root);
    });

    return stackingContexts;
  }

  checkSlideDomValid(slideDom: HTMLElement) {
    const ownerDocument = slideDom.ownerDocument;

    if (!ownerDocument) {
        throw new Error(`Element is not attached to a Document`);
    }

    const defaultView = ownerDocument.defaultView;

    if (!defaultView) {
        throw new Error(`Document is not attached to a Window`);
    }
  }
}