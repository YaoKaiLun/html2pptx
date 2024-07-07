import { Color } from '../../htmlParser/css/types/color';
import { } from '../../htmlParser/css/types/color';

export const color2ColorObj = (color: Color) => {
  const alpha = 0xff & color;
  const blue = 0xff & (color >> 8);
  const green = 0xff & (color >> 16);
  const red = 0xff & (color >> 24);

  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return {
    hex: `#${toHex(red)}${toHex(green)}${toHex(blue)}`,
    transparency: alpha / 255,
  };
};