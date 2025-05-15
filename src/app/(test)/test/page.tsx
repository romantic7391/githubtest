'use client';

import { Code } from "@mantine/core";

export default function TestPage() {
  return (
    <Code block>{JSON.stringify({
      port: process.env.PORT,
      runtime: process.env.NEXT_RUNTIME,
    }, null, 2)}</Code>
  );
}
