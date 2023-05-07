import { ComponentType } from "react";
import { Link } from "previous.js/router";

import "./global.css";

export default function App({ Component }: { Component: ComponentType<{}> }) {
  return (
    <div className="app">
      <div className="nav">
        {["/", "/blog", "/404"].map((i) => (
          <Link href={i} key={i}>
            go to {i}
          </Link>
        ))}
      </div>
      <div className="content">
        <Component />
      </div>
    </div>
  );
}
