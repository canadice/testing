import { VisuallyHidden } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

export const Property = ({
  label,
  value,
  className,
  children,
}: PropsWithChildren<{
  label: string;
  value?: string | number | null;
  className?: string;
}>) => (
  <div className="flex max-w-[400px] flex-nowrap items-center lg:max-w-[600px] xl:max-w-[800px]">
    <VisuallyHidden>{`${label}: ${value}`}</VisuallyHidden>
    <span className="mr-2 font-bold" aria-hidden={Boolean(value)}>
      {label}:{' '}
    </span>
    <p className={`truncate  ${className ?? ''}`}>
      {!children && <span aria-hidden={Boolean(value)}>{value}</span>}
      {children}
    </p>
  </div>
);
