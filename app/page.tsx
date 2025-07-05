'use client';
/*eslint-disable*/

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import Link from '@/components/link/Link';
import ChatMarkdown from '@/components/ChatMarkdown';
import { ChatBody, OpenAIModel } from '@/types/types';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Icon,
  Img,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
  useColorMode,
} from '@chakra-ui/react';
import {
  MdAutoAwesome,
  MdBolt,
  MdEdit,
  MdPerson,
  MdSettings,
} from 'react-icons/md';
import Bg from '../public/img/chat/bg-image.png';

interface Message {
  sender: 'user' | 'assistant';
  content: string;
}

function ChatPage() {
  const searchParams = useSearchParams();
  const chatIdFromUrl = searchParams.get('chatting_with_id');
  const { setColorMode } = useColorMode();

  // Input States
  const [inputCode, setInputCode] = useState<string>('');
  // removed inputOnSubmit & outputCode; using messages array
  // ChatGPT model
  const [model, setModel] = useState<OpenAIModel>('gpt-4o');
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // Admin panel states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [constellaApiKey, setConstellaApiKey] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [shareableLink, setShareableLink] = useState<string>('');
  const [chatId, setChatId] = useState<string | null>(null);

  // Chat messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const currentAssistantIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (chatIdFromUrl) {
      setChatId(chatIdFromUrl);
    }
  }, [chatIdFromUrl]);

  useEffect(() => {
    // Force dark mode on component mount
    setColorMode('dark');
    // Set document title
    document.title = 'DM My AI: By Constella App';
  }, [setColorMode]);

  const handleCreateChat = async () => {
    if (!constellaApiKey) {
      alert('Please enter a Constella API key.');
      return;
    }
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        }/constella-external-api/add-chat-with-me`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-key': constellaApiKey,
          },
          body: JSON.stringify({ custom_prompt: customPrompt }),
        },
      );
      const data = await response.json();
      if (data.success && data._id) {
        setChatId(data._id);
        const link = `${window.location.origin}?chatting_with_id=${data._id}`;
        setShareableLink(link);
        onClose();
      } else {
        alert('Failed to create chat. Please check your API key.');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('An error occurred while creating the chat.');
    }
  };

  // API Key
  // const [apiKey, setApiKey] = useState<string>(apiKeyApp);
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const iconColor = useColorModeValue('brand.500', 'white');
  const bgIcon = useColorModeValue(
    'linear-gradient(180deg, #FBFBFF 0%, #CACAFF 100%)',
    'whiteAlpha.200',
  );
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const buttonBg = useColorModeValue('white', 'whiteAlpha.100');
  const gray = useColorModeValue('gray.500', 'white');
  const buttonShadow = useColorModeValue(
    '14px 27px 45px rgba(112, 144, 176, 0.2)',
    'none',
  );
  const textColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );
  const handleTranslate = async () => {
    if (!chatId) {
      alert('Please configure the chat from the settings first.');
      return;
    }

    const userMessage: Message = { sender: 'user', content: inputCode };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputCode('');
    setLoading(true);
    currentAssistantIndexRef.current = null;

    // Replace with WebSocket logic
    const ws = new WebSocket(
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
        process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/^https?:\/\//, '') ||
        'localhost:8000'
      }/constella-external-api/chat-with-user/${chatId}`,
    );

    let streamTimeout: ReturnType<typeof setTimeout>;

    ws.onopen = () => {
      ws.send(JSON.stringify({ messages: newMessages }));
    };

    let streamedResponse = '';
    ws.onmessage = (event) => {
      const chunk = event.data;
      if (chunk === '|INIT|') {
        return;
      }

      // Clear any existing timeout
      if (streamTimeout) {
        clearTimeout(streamTimeout);
      }

      streamedResponse += chunk;
      setMessages((prev) => {
        let updated = [...prev];
        let idx = currentAssistantIndexRef.current;
        if (idx === null) {
          // Add new assistant message
          updated.push({ sender: 'assistant', content: chunk });
          idx = updated.length - 1;
          currentAssistantIndexRef.current = idx;
        } else {
          // Update existing assistant message
          updated[idx] = {
            ...updated[idx],
            content: updated[idx].content + chunk,
          };
        }
        return updated;
      });

      // Set timeout to stop loading after 3s of no new messages
      streamTimeout = setTimeout(() => {
        setLoading(false);
        currentAssistantIndexRef.current = null;
      }, 3000);
    };

    ws.onclose = () => {
      // Clear timeout and stop loading immediately on close
      if (streamTimeout) {
        clearTimeout(streamTimeout);
      }
      setLoading(false);
      currentAssistantIndexRef.current = null;
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (streamTimeout) {
        clearTimeout(streamTimeout);
      }
      setLoading(false);
      currentAssistantIndexRef.current = null;
      alert('An error occurred with the chat connection.');
    };
  };
  // -------------- Copy Response --------------
  // const copyToClipboard = (text: string) => {
  //   const el = document.createElement('textarea');
  //   el.value = text;
  //   document.body.appendChild(el);
  //   el.select();
  //   document.execCommand('copy');
  //   document.body.removeChild(el);
  // };

  // *** Initializing apiKey with .env.local value
  // useEffect(() => {
  // ENV file verison
  // const apiKeyENV = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  // if (apiKey === undefined || null) {
  //   setApiKey(apiKeyENV)
  // }
  // }, [])

  const handleChange = (Event: any) => {
    setInputCode(Event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleTranslate();
    }
  };

  return (
    <Flex
      w="100%"
      h="100%"
      direction="column"
      position="relative"
      overflow="hidden"
    >
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Admin Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb="8px">Constella API Key</Text>
            <Input
              value={constellaApiKey}
              onChange={(e) => setConstellaApiKey(e.target.value)}
              placeholder="Enter your Constella API key"
            />
            <Text mt="16px" mb="8px">
              Custom Prompt
            </Text>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Set guidelines for what someone cannot see in your notes and what to restrict your notes to. We'll try our 100% best but, of course, we aren't legally liable for this :)"
              minH="100px"
            />
            {shareableLink && (
              <Box mt={4}>
                <Text fontWeight="bold">Shareable Link:</Text>
                <Input value={shareableLink} isReadOnly />
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleCreateChat}>
              Save & Generate Link
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Img
        src={Bg.src}
        position={'absolute'}
        w="350px"
        left="50%"
        top="50%"
        transform={'translate(-50%, -50%)'}
      />
      <Flex
        direction="column"
        mx="auto"
        justifyContent={'space-between'}
        w={{ base: '70vw', md: '70vw', lg: '50vw' }}
        h="100%"
        maxW="1000px"
        overflow="hidden"
      >
        {/* Messages List */}
        <Flex
          direction="column"
          w="100%"
          mx="auto"
          flex="1"
          overflowY="auto"
          mb="20px"
        >
          {messages.map((msg, idx) => (
            <Flex key={idx} w="100%" align={'flex-start'} mb="10px">
              {/* Avatar */}
              <Flex
                borderRadius="full"
                justify="center"
                align="center"
                bg="transparent"
                border="1px solid"
                borderColor={borderColor}
                me="20px"
                h="40px"
                minH="40px"
                minW="40px"
              >
                <Icon
                  as={msg.sender === 'user' ? MdPerson : MdAutoAwesome}
                  width="20px"
                  height="20px"
                  color={msg.sender === 'user' ? 'white' : 'teal.50'}
                />
              </Flex>
              {/* Message Box */}
              <Flex
                p="22px"
                borderRadius="14px"
                w="100%"
                bg="rgba(0,0,0,0.3)"
                backdropFilter="blur(10px)"
              >
                <ChatMarkdown
                  content={msg.content}
                  loading={
                    loading &&
                    idx === messages.length - 1 &&
                    msg.sender === 'assistant'
                  }
                />
              </Flex>
            </Flex>
          ))}
        </Flex>
        {/* Chat Input */}
        <Flex
          ms={{ base: '0px', xl: '60px' }}
          mt="20px"
          justifySelf={'flex-end'}
        >
          <Input
            minH="54px"
            h="100%"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="45px"
            p="15px 20px"
            me="10px"
            fontSize="sm"
            fontWeight="500"
            _focus={{ borderColor: 'teal.400' }}
            color={inputColor}
            _placeholder={placeholderColor}
            placeholder="Type your message here..."
            onChange={handleChange}
            value={inputCode}
            onKeyDown={handleKeyDown}
          />
          <Button
            bg="linear-gradient(15.46deg, #319795 26.3%, #4FD1C7 86.4%)"
            py="20px"
            px="16px"
            fontSize="sm"
            borderRadius="45px"
            ms="auto"
            w={{ base: '160px', md: '210px' }}
            h="54px"
            color="white"
            _hover={{
              boxShadow:
                '0px 21px 27px -10px rgba(49, 151, 149, 0.48) !important',
              bg: 'linear-gradient(15.46deg, #2C7A7B 26.3%, #319795 86.4%) !important',
              _disabled: {
                bg: 'linear-gradient(15.46deg, #319795 26.3%, #4FD1C7 86.4%)',
              },
            }}
            onClick={handleTranslate}
            isLoading={loading}
          >
            Submit
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default function Chat() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPage />
    </Suspense>
  );
}
