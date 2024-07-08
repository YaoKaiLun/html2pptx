# html2pptx

**inspired by html2canvas**

将 html 导出成可编辑的 ppt

使用：

```
import { html2pptx } from 'html2pptx';

const slideDoms = presentationRef.current.querySelectorAll<HTMLElement>('.pdf-page');
await html2pptx(
  presentationRef.current,
  Array.from(slideDoms),
  {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    fileName: 'reveal-export'
  },
);
```