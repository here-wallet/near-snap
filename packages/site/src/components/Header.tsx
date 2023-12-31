import { useContext } from 'react';
import styled, { useTheme } from 'styled-components';

import { ToggleThemeContext } from '../Root';
import { getThemePreference } from '../theme';
import { HeaderButtons } from './Buttons';
import { SnapLogo } from './SnapLogo';
import { Toggle } from './Toggle';

const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2.4rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border.default};
`;

const Title = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
  margin-left: 1.2rem;
  ${({ theme }) => theme.mediaQueries.small} {
    display: none;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const Header = () => {
  const theme = useTheme();
  const toggleTheme = useContext(ToggleThemeContext);

  return (
    <HeaderWrapper>
      <LogoWrapper>
        <SnapLogo color={theme.colors.icon.default} size={36} />
        <Title>near-snap</Title>
      </LogoWrapper>
      <RightContainer>
        <Toggle onToggle={toggleTheme} defaultChecked={getThemePreference()} />
        <HeaderButtons />
      </RightContainer>
    </HeaderWrapper>
  );
};
