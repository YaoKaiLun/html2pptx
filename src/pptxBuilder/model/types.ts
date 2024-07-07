export interface IPresentationAttrs {
  width: number;
  height: number;
}

interface IRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface IElement extends IRect {
  type: string;
}

export interface ISlideAttrs {}

export interface ITextModel extends IElement {
  type: 'text',
  text: string;
  color?: string;
  fontSize?: number;
  bold?: boolean;
  fontFace?: string;
}

export interface IShapeModel extends IElement {
  type: 'shape',
  fill?: {
    color: string;
    opacity: number;
  },
}

export interface IImageModel extends IElement {
  type: 'image',
  src: string;
}

export type TSlideElement = IShapeModel | IImageModel | ITextModel;

export interface ISlideModel {
  attrs: ISlideAttrs;
  elements: Array<TSlideElement>
}

export interface IPresentationModel {
  attrs: IPresentationAttrs;
  slides: ISlideModel[];
}