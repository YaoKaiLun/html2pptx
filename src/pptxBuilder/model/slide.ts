import { cloneDeep } from 'lodash';
import { ISlideAttrs, ISlideModel, TSlideElement } from './types';

export default class SlideModel {
  attrs: ISlideAttrs = {};
  elements: Array<TSlideElement> = [];

  addElement(element: TSlideElement) {
    this.elements.push(element);
  }

  toJSON(): ISlideModel {
    return {
      attrs: cloneDeep(this.attrs),
      elements: cloneDeep(this.elements),
    }
  }
}