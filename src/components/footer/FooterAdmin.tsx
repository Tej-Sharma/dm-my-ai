'use client';
/*eslint-disable*/

import {
  Flex,
  List,
  ListItem,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from '@/components/link/Link';

export default function Footer() {
  const textColor = useColorModeValue('gray.500', 'white');
  return (
    <Flex
      zIndex="3"
      flexDirection={{
        base: 'column',
        xl: 'row',
      }}
      alignItems="center"
      justifyContent="space-between"
      px={{ base: '30px', md: '50px' }}
      pb="30px"
    >
      <Text
        color={textColor}
        fontSize={{ base: 'xs', md: 'sm' }}
        textAlign={{
          base: 'center',
          xl: 'start',
        }}
        fontWeight="500"
        mb={{ base: '10px', xl: '0px' }}
      >
        {' '}
        &copy; {new Date().getFullYear()}
        <Text as="span" fontWeight="500" ms="4px">
          Powered by Constella App, Inc. All Rights Reserved.
        </Text>
      </Text>
      <List display="flex">
        <ListItem>
          <Link
            fontWeight="500"
            fontSize={{ base: 'xs', md: 'sm' }}
            color={textColor}
            href="https://constella.app"
          >
            Get My Constella
          </Link>
        </ListItem>
      </List>
    </Flex>
  );
}
