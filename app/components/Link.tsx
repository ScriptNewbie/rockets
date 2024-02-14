"use client";
import NextLink from "next/link";

import { ReactNode, useState } from "react";

interface Props {
  href: string;
  children: ReactNode;
}

function Link({ href, children }: Props) {
  const [isClicked, setIsClicked] = useState(false);
  return (
    <div
      onClick={() => {
        setIsClicked(true);
      }}
      className={isClicked ? "pulse " : ""}
    >
      <NextLink href={href}>{children}</NextLink>
    </div>
  );
}

export default Link;
