'use client';
import React, { ReactNode, Suspense } from 'react';
import type { AppProps } from 'next/app';
import {
  ChakraProvider,
  Box,
  Portal,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Text,
  Textarea,
  Button,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import theme from '@/theme/theme';
import routes from '@/routes';
import Footer from '@/components/footer/FooterAdmin';
import Navbar from '@/components/navbar/NavbarAdmin';
import { getActiveRoute, getActiveNavbar } from '@/utils/navigation';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import '@/styles/App.css';
import '@/styles/Contact.css';
import '@/styles/Plugins.css';
import '@/styles/MiniCalendar.css';
import AppWrappers from './AppWrappers';

function LayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isChatView = searchParams.has('chatting_with_id');
  const [apiKey, setApiKey] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [constellaApiKey, setConstellaApiKey] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [shareableLink, setShareableLink] = useState('');
  const toast = useToast();

  // Color mode values
  const inputTextColor = useColorModeValue('navy.700', 'white');
  const textareaTextColor = useColorModeValue('navy.700', 'white');

  useEffect(() => {
    const initialKey = localStorage.getItem('apiKey');
    if (initialKey?.includes('sk-') && apiKey !== initialKey) {
      setApiKey(initialKey);
    }
  }, [apiKey]);

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
      if (data && data.success && data._id) {
        const link = `${window.location.origin}?chatting_with_id=${data._id}`;
        setShareableLink(link);

        // Copy to clipboard
        try {
          await navigator.clipboard.writeText(link);
          toast({
            title: 'Success!',
            description: 'Shareable link copied to clipboard',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } catch (clipboardError) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = link;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);

          toast({
            title: 'Success!',
            description: 'Shareable link copied to clipboard',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }

        onClose();
      } else {
        alert('Failed to create or update chat configuration.');
      }
    } catch (err) {
      console.error(err);
      alert('Error while creating chat configuration.');
    }
  };

  return (
    <>
      {pathname?.includes('register') || pathname?.includes('sign-in') ? (
        children
      ) : (
        <Box
          pt={{ base: '60px', md: '100px' }}
          display="flex"
          flexDirection="column"
          minH="100vh"
          h="100vh"
          overflow="hidden"
          position="relative"
          w={{ base: '100%', xl: 'calc( 100% - 0px )' }}
          maxWidth={{ base: '100%', xl: 'calc( 100% - 0px )' }}
          transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
          transitionDuration=".2s, .2s, .35s"
          transitionProperty="top, bottom, width"
          transitionTimingFunction="linear, linear, ease"
        >
          <Portal>
            <Box>
              <Navbar
                setApiKey={setApiKey}
                onOpen={onOpen}
                logoText={'Horizon UI Dashboard PRO'}
                brandText={getActiveRoute(routes, pathname)}
                secondary={getActiveNavbar(routes, pathname)}
                isChatView={isChatView}
              />
            </Box>
          </Portal>
          <Box
            mx="auto"
            p={{ base: '20px', md: '30px' }}
            pe="20px"
            flex="1"
            overflow="hidden"
            pt="50px"
            display="flex"
            flexDirection="column"
          >
            {children}
          </Box>
          <Box mt="auto">
            <Footer />
          </Box>
        </Box>
      )}

      {/* Configuration Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Configure Your Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb="8px">Constella API Key</Text>
            <Input
              placeholder="Enter your Constella API key"
              value={constellaApiKey}
              onChange={(e) => setConstellaApiKey(e.target.value)}
              color={inputTextColor}
            />
            <Text mt="16px" mb="8px">
              Custom Prompt
            </Text>
            <Textarea
              placeholder="Set guidelines for what someone cannot see in your notes and what to restrict your notes to. We'll try our 100% best but, of course, we aren't legally liable for this :)"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              minH="100px"
              color={textareaTextColor}
            />
            {shareableLink && (
              <Box mt={4}>
                <Text fontWeight="bold">Shareable Link</Text>
                <Input
                  value={shareableLink}
                  isReadOnly
                  color={inputTextColor}
                />
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCreateChat}>
              Save & Generate Link
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body id={'root'}>
        <AppWrappers>
          <Suspense fallback={<div>Loading...</div>}>
            <LayoutContent>{children}</LayoutContent>
          </Suspense>
        </AppWrappers>
      </body>
    </html>
  );
}
