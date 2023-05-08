import { ReactNode } from "react";
import { Link } from "previous.js/router";

import "./global.css";

export default function App({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <div className="nav">
        {["/", "/blog", "/404"].map((i) => (
          <Link href={i} key={i}>
            go to {i}
          </Link>
        ))}
      </div>
      <div className="content">{children}</div>
    </div>
  );
}
