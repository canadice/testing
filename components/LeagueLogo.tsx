import SSLLogo from '../public/SSL.svg';

export const LeagueLogo = ({
    league,
    ...props
}: React.SVGProps<SVGSVGElement> & { league: string }) => {
    switch (league) {
        case 'shl':
            return <SSLLogo {...props} />;
        case 'smjhl':
            // return <SMJHLLogo {...props} />;
            break;
        default:
            return <div />;
    }
};