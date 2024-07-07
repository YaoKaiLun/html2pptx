import { Context } from '../../core/context';
import { StackingContext } from '../../htmlParser/stacking-context';
import PresentationModel from '../model/presentation';
import SlideConverter from './slide';

interface IConverterOptions {
  width: number;
  height: number;
}

export default class PresentationConverter {
  context: Context;
  options: IConverterOptions;
  stackingContexts: StackingContext[];
  presentationModel?: PresentationModel;

  constructor(context: Context, stackingContexts: StackingContext[], options: IConverterOptions) {
    this.context = context;
    this.options = options;
    this.stackingContexts = stackingContexts;
  }

  async convert() {
    this.presentationModel = new PresentationModel({
      width: this.options.width,
      height: this.options.height,
    });

    for (let stackingContext of this.stackingContexts) {
      const slideConverter = new SlideConverter(this.context, this.presentationModel!, stackingContext);
      await slideConverter.convert();
    }

    return this.presentationModel.toJSON();
  }
}