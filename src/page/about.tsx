import AddModeratorIcon from "@mui/icons-material/AddModerator";
import { Stack } from "@mui/material";
import { observer } from "mobx-react-lite";
import {
  ButtonContained,
  ButtonOutlined,
  ButtonText,
  ButtonWrapper,
  TextLink,
  TextNormal,
  TextSecondary,
  TitleLevel1,
  TitleLevel2,
  TitleLevel3,
} from "../component";
import { TextSmall } from "../component/typography/text-small";

export const AboutPage = observer(() => {
  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <TitleLevel1>Overview</TitleLevel1>
        <TextNormal>
          This is a React starter template for business applications, with
          routing, state management, and theming built in.
        </TextNormal>
      </Stack>
      <Stack spacing={1}>
        <TitleLevel2>1.Technology Stack</TitleLevel2>
        <TextNormal>
          <TextLink href="https://react.dev">React 19.3</TextLink> +{" "}
          <TextLink href="https://www.typescriptlang.org/">TypeScript</TextLink>{" "}
          + <TextLink href="https://vite.dev">Vite</TextLink>, with{" "}
          <TextLink href="https://reactrouter.com/">React Router</TextLink>,
          MobX, MobX-State-Tree, MUI, ESLint, and Prettier integrated.
        </TextNormal>
      </Stack>
      <Stack spacing={1}>
        <TitleLevel3>Core Libraries</TitleLevel3>
        <TextNormal>
          <TextLink href="https://mobx.js.org/">MobX</TextLink>: Drives reactive
          UI updates with less boilerplate code.
        </TextNormal>
        <TextNormal>
          <TextLink href="https://mobx-state-tree.js.org/">
            MobX-State-Tree
          </TextLink>
          : Adds structured models, snapshots, and typed state flows on top of
          MobX.
        </TextNormal>
        <TextNormal>
          <TextLink href="https://mui.com/">MUI</TextLink>: Provides a
          consistent component system and theming for faster UI delivery.
        </TextNormal>
      </Stack>
      <Stack spacing={1}>
        <TitleLevel3>Quick Start</TitleLevel3>

        <TextNormal>
          After installing Node.js and npm, run the commands below to start
          locally:
        </TextNormal>
        <TextNormal component={"code"}>
          - npm install
          <br />- npm run dev
        </TextNormal>
        <TextSecondary>
          For more details, see the
          <TextLink href="https://react.dev"> React documentation</TextLink> and
          <TextLink href="https://vite.dev"> Vite documentation</TextLink>.
        </TextSecondary>
        <TextSmall>
          Start from <TextLink href="/">Home</TextLink> and expand pages, state,
          and business modules as your app grows.
        </TextSmall>
      </Stack>
      <Stack spacing={1}>
        <TitleLevel2>2. Component Overview</TitleLevel2>
        <TextNormal>
          This project includes a reusable component layer organized for fast UI
          development.
        </TextNormal>
      </Stack>
      <Stack spacing={1}>
        <TitleLevel3>Buttons</TitleLevel3>
        <TextNormal>
          Buttons: Contained, Outlined, Flat, and a ButtonWrapper for grouped
          actions.
        </TextNormal>
        <ButtonWrapper>
          <ButtonContained>Contained</ButtonContained>
          <ButtonContained disabled>Contained</ButtonContained>
          <ButtonOutlined>Outlined</ButtonOutlined>
          <ButtonOutlined disabled>Outlined</ButtonOutlined>
        </ButtonWrapper>
        <ButtonWrapper>
          <ButtonText>Text</ButtonText>
          <ButtonText disabled>Text</ButtonText>
          <ButtonText startIcon={<AddModeratorIcon />}>Text</ButtonText>
          <ButtonText disabled startIcon={<AddModeratorIcon />}>
            Text
          </ButtonText>
        </ButtonWrapper>
      </Stack>
      <Stack spacing={1}>
        <TitleLevel3>Forms</TitleLevel3>
        <TextNormal>
          Text, Email, Numeric, Date, DateTime, Select, Checkbox, RadioGroup,
          and other input primitives.
        </TextNormal>
      </Stack>
      <Stack spacing={1}>
        <TitleLevel3>Typography</TitleLevel3>
        <TextNormal>
          Title levels, normal text, secondary text, and link text styles for
          consistent content hierarchy.
        </TextNormal>
        <Stack spacing={1} component={"figure"}>
          <TitleLevel1>Title Level 1</TitleLevel1>
          <TitleLevel2>Title Level 2</TitleLevel2>
          <TitleLevel3>Title Level 3</TitleLevel3>
          <TextNormal>Normal Text</TextNormal>
          <TextSecondary>Secondary Text</TextSecondary>
          <TextSmall>Small Text</TextSmall>
          <TextLink href="https://react.dev">Link Text</TextLink>
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <TitleLevel3>Loading</TitleLevel3>
        <TextNormal>
          A full-area overlay spinner for async states and data-loading
          transitions.
        </TextNormal>
      </Stack>
    </Stack>
  );
});
