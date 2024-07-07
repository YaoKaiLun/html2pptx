import { Context, IContextOptions } from './core/context';
import { HtmlParser } from './htmlParser';
import { Bounds } from './htmlParser/css/layout/bounds';
import { PptxBuilder, TPptxBuilderOptions } from './pptxBuilder';

interface IOptions extends IContextOptions, TPptxBuilderOptions {
  fileName: string;
}

export async function html2pptx(container: HTMLElement, slideDoms: HTMLElement[], options: IOptions) {
  if (!container || typeof container !== 'object') {
    return Promise.reject('Invalid container provided as first argument');
  }

  const ownerDocument = container.ownerDocument;

  if (!ownerDocument) {
      throw new Error(`Container is not attached to a Document`);
  }

  const defaultView = ownerDocument.defaultView;

  if (!defaultView) {
      throw new Error(`Container is not attached to a Window`);
  }

  const contextOptions = {
    logging: options.logging ?? true,
  };

  const windowOptions = {
    windowWidth: defaultView.innerWidth,
    windowHeight: defaultView.innerHeight,
    scrollX: defaultView.pageXOffset,
    scrollY: defaultView.pageYOffset
  };

  const windowBounds = new Bounds(
      windowOptions.scrollX,
      windowOptions.scrollY,
      windowOptions.windowWidth,
      windowOptions.windowHeight
  );

  const context = new Context(contextOptions, windowBounds);

  const htmlParser = new HtmlParser(context, slideDoms);
  const stackingContexts = htmlParser.parse();
  console.log('stackingContexts', stackingContexts);

  const buildOptions = {
    width: options.width,
    height: options.height,
  };
  const builder = new PptxBuilder(context, stackingContexts, buildOptions);
  await builder.build();

  return builder.export(options.fileName);
}