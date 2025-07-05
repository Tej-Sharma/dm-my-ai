import ReactMarkdown from 'react-markdown';
import { FC } from 'react';
import {
  Box,
  Code,
  Heading,
  Text,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface Props {
  content: string;
  loading?: boolean;
}

export const ChatMarkdown: FC<Props> = ({ content, loading = false }) => {
  const textColor = useColorModeValue('navy.700', 'white');
  const codeColor = useColorModeValue('gray.800', 'gray.200');
  const codeBg = useColorModeValue('gray.100', 'gray.700');
  const blockquoteBg = useColorModeValue('gray.50', 'gray.800');
  const blockquoteBorder = useColorModeValue('gray.300', 'gray.600');

  return (
    <Box color={textColor} display="flex" alignItems="flex-start">
      <Box flex="1">
        <ReactMarkdown
          components={{
            // Headings
            h1: ({ children }) => (
              <Heading as="h1" size="xl" mb={4} mt={6} color={textColor}>
                {children}
              </Heading>
            ),
            h2: ({ children }) => (
              <Heading as="h2" size="lg" mb={3} mt={5} color={textColor}>
                {children}
              </Heading>
            ),
            h3: ({ children }) => (
              <Heading as="h3" size="md" mb={2} mt={4} color={textColor}>
                {children}
              </Heading>
            ),
            h4: ({ children }) => (
              <Heading as="h4" size="sm" mb={2} mt={3} color={textColor}>
                {children}
              </Heading>
            ),
            h5: ({ children }) => (
              <Heading as="h5" size="xs" mb={2} mt={3} color={textColor}>
                {children}
              </Heading>
            ),
            h6: ({ children }) => (
              <Heading as="h6" size="xs" mb={2} mt={3} color={textColor}>
                {children}
              </Heading>
            ),

            // Paragraphs
            p: ({ children }) => (
              <Text mb={3} lineHeight="1.6" color={textColor}>
                {children}
              </Text>
            ),

            // Strong (bold)
            strong: ({ children }) => (
              <Text as="strong" fontWeight="bold" color={textColor}>
                {children}
              </Text>
            ),

            // Emphasis (italic)
            em: ({ children }) => (
              <Text as="em" fontStyle="italic" color={textColor}>
                {children}
              </Text>
            ),

            // Inline code
            code: ({ children, className }) => {
              const match = /language-(\w+)/.exec(className || '');
              return !match ? (
                <Code
                  px={2}
                  py={1}
                  bg={codeBg}
                  color={codeColor}
                  borderRadius="md"
                  fontSize="sm"
                >
                  {children}
                </Code>
              ) : (
                <Box my={4} borderRadius="md" overflow="hidden">
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </Box>
              );
            },

            // Blockquotes
            blockquote: ({ children }) => (
              <Box
                pl={4}
                borderLeft="4px solid"
                borderColor={blockquoteBorder}
                bg={blockquoteBg}
                py={2}
                px={4}
                my={4}
                borderRadius="md"
              >
                {children}
              </Box>
            ),

            // Lists
            ul: ({ children }) => (
              <Box as="ul" pl={6} mb={3} sx={{ listStyleType: 'disc' }}>
                {children}
              </Box>
            ),
            ol: ({ children }) => (
              <Box as="ol" pl={6} mb={3} sx={{ listStyleType: 'decimal' }}>
                {children}
              </Box>
            ),
            li: ({ children }) => (
              <Box as="li" mb={1} color={textColor}>
                {children}
              </Box>
            ),

            // Links
            a: ({ children, href }) => (
              <Text
                as="a"
                href={href}
                color="teal.400"
                textDecoration="underline"
                _hover={{ color: 'teal.300' }}
              >
                {children}
              </Text>
            ),

            // Horizontal rule
            hr: () => <Box as="hr" borderColor={blockquoteBorder} my={6} />,

            // Tables
            table: ({ children }) => (
              <Box
                as="table"
                width="100%"
                my={4}
                border="1px solid"
                borderColor={blockquoteBorder}
                borderRadius="md"
                overflow="hidden"
                sx={{ borderCollapse: 'collapse' }}
              >
                {children}
              </Box>
            ),
            th: ({ children }) => (
              <Box
                as="th"
                p={3}
                bg={blockquoteBg}
                border="1px solid"
                borderColor={blockquoteBorder}
                fontWeight="bold"
                textAlign="left"
              >
                {children}
              </Box>
            ),
            td: ({ children }) => (
              <Box
                as="td"
                p={3}
                border="1px solid"
                borderColor={blockquoteBorder}
              >
                {children}
              </Box>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </Box>
      {loading && <Spinner size="sm" ml={2} />}
    </Box>
  );
};

export default ChatMarkdown;
