import { ReactNode } from 'react';
import styled from 'styled-components';

type CardProps = {
  style?: any;
  disabled?: boolean;
  content: {
    title?: string;
    description: ReactNode;
    button?: ReactNode;
  };
};

const CardWrapper = styled.div<{ disabled: boolean }>`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.card.default};
  overflow-wrap: break-word;
  padding: 2.4rem;
  gap: 2.4rem;
  width: calc(50% - 64px);
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.default};
  box-shadow: ${({ theme }) => theme.shadows.default};
  filter: opacity(${({ disabled }) => (disabled ? '.4' : '1')});
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const Description = styled.div`
  overflow-wrap: break-word;
`;

export const Card = ({ style, content, disabled = false }: CardProps) => {
  const { title, description, button } = content;
  return (
    <CardWrapper style={style} disabled={disabled}>
      {title && <Title>{title}</Title>}
      <Description>{description}</Description>
      {button}
    </CardWrapper>
  );
};
