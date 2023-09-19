import { SubHeading } from 'components/common/SubHeading';

export const AttributeSectionWrapper = ({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="pb-4">
      <SubHeading className="text-base font-normal">{heading}</SubHeading>
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-6 p-2">
        {children}
      </div>
    </div>
  );
};
