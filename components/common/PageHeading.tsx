import { HTMLAttributes, PropsWithChildren } from 'react';

export const PageHeading = ({
  className,
  children,
}: PropsWithChildren<{
  className?: HTMLAttributes<HTMLDivElement>['className'];
}>) => {
  return (
    <div
      className={`border-b-8 border-b-blue600 bg-grey900 p-2 text-lg font-bold text-grey100 sm:text-xl ${className}`}
    >
      {children}
    </div>
  );
};
