import { HTMLAttributes, PropsWithChildren } from 'react';

export const SubHeading = ({
    className,
    children,
}: PropsWithChildren<{
    className?: HTMLAttributes<HTMLDivElement>['className'];
}>) => {
    return (
        <div
            className={`border-b-4 border-b-grey650 bg-grey900 p-2 text-sm font-semibold text-grey100 sm:text-base ${className}`}
        >
            {children}
        </div>
    );
};