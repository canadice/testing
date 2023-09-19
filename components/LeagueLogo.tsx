import SHLLogo from 'public/league_logos/SHL.svg';
import SMJHLLogo from 'public/league_logos/SMJHL.svg';

export const LeagueLogo = ({
  league,
  ...props
}: React.SVGProps<SVGSVGElement> & { league: string }) => {
  switch (league) {
    case 'shl':
      return <SHLLogo {...props} />;
    case 'smjhl':
      return <SMJHLLogo {...props} />;
    default:
      return <div />;
  }
};
