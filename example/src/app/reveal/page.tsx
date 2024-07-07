'use client'

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { html2pptx } from '../../../../src/index';
import { SLIDE_HEIGHT, SLIDE_WIDTH } from '../constants';
import style from './style.module.scss';

const Presentation = dynamic(() => import('./components/presentation'), { ssr: false });

export default function RevealPage() {
  const presentationRef = useRef<HTMLElement | null>(null);

  const handleExport = () => {
    if (!presentationRef.current) {
      return;
    }

    const slideDoms = presentationRef.current.querySelectorAll<HTMLElement>('.pdf-page');
    html2pptx(
      presentationRef.current,
      Array.from(slideDoms),
      {
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        fileName: 'reveal-export'
      },
    );
  };

  return (
    <main className={style.revealPage}>
      <button
        className={style.exportBtn}
        onClick={handleExport}
      >
        导出
      </button>
      <section ref={presentationRef}>
        <Presentation />
      </section>
    </main>
  );
}
