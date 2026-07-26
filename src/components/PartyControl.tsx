import { HStack, IconButton, Span, Stack, Text, Wrap } from '@chakra-ui/react';
import { useTrip } from '../state/TripContext';

/**
 * Party-size stepper. Only two prices in the whole trip actually scale with
 * this (see `lib/pricing.ts`), so the note below is upfront about the limit
 * rather than implying every euro on screen will move.
 */
export function PartyControl() {
  const { party, setParty, budget } = useTrip();

  const adjustAdults = (delta: number) => {
    setParty({ ...party, adults: Math.max(1, party.adults + delta) });
  };
  const adjustChildren = (delta: number) => {
    setParty({ ...party, children: Math.max(0, party.children + delta) });
  };

  return (
    <Stack gap="1">
      <Wrap align="center" gap="4">
        <Stepper label="Yetişkin" value={party.adults} onChange={adjustAdults} min={1} />
        <Stepper label="Çocuk" value={party.children} onChange={adjustChildren} min={0} />
      </Wrap>
      <Text maxW="prose" fontSize="xs" color="fg.muted">
        Kişi sayısı sadece kişi başı yazılmış fiyatları değiştirir (şu an €
        {Math.round(budget.partySensitiveTotal)}
        'luk kısım). Bir bistecca veya paylaşılan bir tabak gibi "masaya" yazılmış fiyatlar sabit
        kalır — grup büyüse de küçülse de aynı yemeği paylaşırsınız.
      </Text>
    </Stack>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min,
}: {
  readonly label: string;
  readonly value: number;
  readonly onChange: (delta: number) => void;
  readonly min: number;
}) {
  return (
    <HStack as="span" gap="2">
      <Span fontSize="sm" fontWeight="medium">
        {label}
      </Span>
      <StepButton
        aria-label={`${label} sayısını azalt`}
        disabled={value <= min}
        onClick={() => onChange(-1)}
      >
        −
      </StepButton>
      <Span
        aria-live="polite"
        minW="6"
        textAlign="center"
        fontFamily="heading"
        fontSize="md"
        fontVariantNumeric="tabular-nums"
      >
        {value}
      </Span>
      <StepButton aria-label={`${label} sayısını artır`} onClick={() => onChange(1)}>
        +
      </StepButton>
    </HStack>
  );
}

function StepButton({
  children,
  ...rest
}: {
  readonly children: string;
  readonly 'aria-label': string;
  readonly disabled?: boolean;
  readonly onClick: () => void;
}) {
  return (
    <IconButton
      variant="plain"
      minH="11"
      minW="11"
      borderWidth="1px"
      borderColor="border"
      bg="bg.panel"
      color="accent"
      rounded="l1"
      fontSize="lg"
      fontWeight="semibold"
      _hover={{ bg: 'bg.subtle' }}
      _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
      {...rest}
    >
      {children}
    </IconButton>
  );
}
