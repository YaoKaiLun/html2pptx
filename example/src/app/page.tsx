import Link from 'next/link';
import style from './style.module.scss';

export default function Home() {
  return (
    <main className={style.homePage}>
      <h1 className={style.title}>html2pptx</h1>
      <section>
        <h4>examples:</h4>
        <ul>
          <li>
            <Link href="/reveal">reveal.js </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
