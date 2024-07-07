import SlideModel from './slide';
import { cloneDeep } from 'lodash';
import { IPresentationAttrs, IPresentationModel } from './types';

export default class PresentationModel {
  attrs: IPresentationAttrs;
  slides: SlideModel[] = [];

  constructor(attrs: IPresentationAttrs) {
    this.attrs = attrs;
  }
   
  addSlide(slideModel: SlideModel) {
    this.slides.push(slideModel);
  }

  toJSON(): IPresentationModel {
    return {
      attrs: cloneDeep(this.attrs),
      slides: this.slides.map(slide => slide.toJSON()),
    };
  }
}