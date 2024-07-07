import { useEffect, useRef } from 'react';
import Reveal from 'reveal.js';
import { SLIDE_HEIGHT, SLIDE_WIDTH } from '@/app/constants';
import style from './style.module.scss';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/black.css';

export default function Presentation() {
  const deckDivRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<Reveal.Api | null>(null);

  useEffect(() => {
    if (!deckDivRef.current || deckRef.current) {
      return;
    }

    deckRef.current = new Reveal(deckDivRef.current, {
      view: 'print',
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
      minScale: 1,
      maxScale: 1,
    });
    deckRef.current.initialize().then();

    return () => {
      if (deckRef.current) {
        try {
          deckRef.current.destroy();
          deckRef.current = null; 
        } catch (error) {
          console.warn("Reveal.js destroy call failed.");
        }
      }
  };
  }, []);

  return (
    <div className={style.presentationContainer}>
      <div className="reveal" ref={deckDivRef}>
        <div className="slides">
          <section className="slide" data-background-color="aquamarine">
            <h2>Slide 1</h2>
            <h3>🍦</h3>
          </section>
          <section className="slide" data-background-color="rgb(70, 70, 255)">
            <h2>Slide 2</h2>
            <h3>🍰</h3>
          </section>
        </div>
      </div>
    </div>
  );
}
