import { Badge, Box, Flex, List, Span, Text } from '@chakra-ui/react';
import type { Shopping } from '../data/schema';
import { euro } from '../lib/format';
import { NavButton } from './NavButton';

export function ShoppingSection({ shopping }: { readonly shopping: readonly Shopping[] }) {
  if (shopping.length === 0) {
    return (
      <Text fontSize="sm" color="fg.muted">
        Bu gün için ayrı bir alışveriş durağı yok.
      </Text>
    );
  }

  return (
    <List.Root gap="2" listStyle="none" ms="0">
      {shopping.map((entry) => (
        <List.Item key={entry.name} layerStyle="card" p="3">
          <Flex wrap="wrap" align="start" justify="space-between" gap="2">
            <Text fontFamily="heading" fontWeight="medium">
              {entry.name}
              {entry.highlight === true && (
                <Badge
                  ms="2"
                  variant="plain"
                  bg="antimony"
                  color="ink"
                  px="1.5"
                  py="0.5"
                  fontSize="xs"
                  fontWeight="semibold"
                >
                  Öne çıkan
                </Badge>
              )}
            </Text>
            <Span fontSize="sm" color="fg.muted">
              {entry.cost === undefined || entry.cost === null ? 'fiyat yok' : euro(entry.cost)}
            </Span>
          </Flex>
          <Text mt="1" fontSize="sm">
            {entry.for}
          </Text>
          {entry.address !== undefined && (
            <Text fontSize="xs" color="fg.muted">
              {entry.address}
            </Text>
          )}
          {entry.tip !== undefined && (
            <Text mt="1" fontSize="sm" fontStyle="italic">
              {entry.tip}
            </Text>
          )}
          {entry.nav !== undefined && (
            <Box mt="2">
              <NavButton place={{ name: entry.name, nav: entry.nav }} />
            </Box>
          )}
        </List.Item>
      ))}
    </List.Root>
  );
}
