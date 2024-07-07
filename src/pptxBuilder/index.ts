import Pptxgen from "pptxgenjs";
import { Context } from '../core/context';
import { StackingContext } from '../htmlParser/stacking-context';
import PresentationConverter from './converter/presentation';
import { buildPresentation } from './builder';

export type TPptxBuilderOptions = {
  width: number;
  height: number;
}

export class PptxBuilder {
  options: TPptxBuilderOptions;
  context: Context;
  stackingContexts: StackingContext[];
  presentation?: Pptxgen;

  constructor(context: Context, stackingContexts: StackingContext[], options: TPptxBuilderOptions) {
    this.options = options;
    this.context = context;
    this.stackingContexts = stackingContexts;
  }

  async build() {
    const converterOption = {
      width: this.options.width,
      height: this.options.height,
    };
    const converter = new PresentationConverter(this.context, this.stackingContexts, converterOption);
    const modelJSON = await converter.convert();
    console.log('modelJSON', modelJSON);

    this.presentation = buildPresentation(modelJSON);
  }

  export(fileName: string) {
    this.presentation?.writeFile({ fileName });  
  }
}