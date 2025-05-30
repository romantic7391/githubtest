import { Fragment } from 'react';
import { ZodError } from 'zod';

export default function ZodErrorDisplay({ error }: { error: ZodError }) {
  return error.issues.map((issue, index, array) => {
    return (
      <Fragment key={issue.code}>
        {issue.message}
        {index < array.length - 1 ? <br /> : ''}
      </Fragment>
    );
  });
}
