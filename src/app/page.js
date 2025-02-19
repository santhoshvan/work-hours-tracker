"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  Flex,
  Text,
  Container,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [employeeName, setEmployeeName] = useState("");
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [task, setTask] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEntries = JSON.parse(localStorage.getItem("hoursTracking")) || [];
      setEntries(savedEntries);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hoursTracking", JSON.stringify(entries));
    }
  }, [entries]);

  const handleAddEntry = () => {
    if (!employeeName || !date || !hours || !task) {
      toast({
        title: "All fields are required.",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    const newEntry = { employeeName, date, hours, task };
    setEntries([...entries, newEntry]);
    setEmployeeName("");
    setDate("");
    setHours("");
    setTask("");
    toast({
      title: "Entry added successfully.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleClearEntries = () => {
    setEntries([]);
    toast({
      title: "All entries cleared.",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDeleteEntry = (indexToDelete) => {
    const updatedEntries = entries.filter((_, index) => index !== indexToDelete);
    setEntries(updatedEntries);
    toast({
      title: "Entry deleted.",
      status: "error",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Flex justify="center" align="center" minH="100vh" bgGradient="linear(to-br, blue.100, gray.50)">
      <Container maxW="900px" py="8">
        <Box
          p="8"
          bg="white"
          rounded="xl"
          shadow="2xl"
          border="1px solid"
          borderColor="gray.200"
        >
          <Heading textAlign="center" mb="6" color="blue.600">
            Work Hours Tracker
          </Heading>
          <VStack spacing="4" mb="8">
            <Input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Employee Name"
              size="lg"
              focusBorderColor="blue.500"
            />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Date"
              size="lg"
              focusBorderColor="blue.500"
            />
            <Input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Hours worked"
              size="lg"
              focusBorderColor="blue.500"
            />
            <Input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Task description"
              size="lg"
              focusBorderColor="blue.500"
            />
            <HStack spacing="4" mt="4">
              <Button colorScheme="green" size="lg" onClick={handleAddEntry} shadow="md" _hover={{ shadow: "xl" }}>
                Add Entry
              </Button>
              <Button colorScheme="red" size="lg" onClick={handleClearEntries} shadow="md" _hover={{ shadow: "xl" }}>
                Clear All Entries
              </Button>
            </HStack>
          </VStack>

          {entries.length > 0 ? (
            <Table variant="striped" colorScheme="blue">
              <Thead>
                <Tr bg="blue.600">
                  <Th color="white">Employee Name</Th>
                  <Th color="white">Date</Th>
                  <Th color="white">Hours</Th>
                  <Th color="white">Task</Th>
                  <Th color="white">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {entries.map((entry, index) => (
                  <Tr key={index} _hover={{ bg: "gray.100" }}>
                    <Td fontWeight="medium">{entry.employeeName}</Td>
                    <Td fontWeight="medium">{entry.date}</Td>
                    <Td fontWeight="medium">{entry.hours}</Td>
                    <Td>{entry.task}</Td>
                    <Td>
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDeleteEntry(index)}
                        aria-label="Delete Entry"
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text mt="4" color="gray.500" textAlign="center">
              No entries found. Start tracking your hours now!
            </Text>
          )}
        </Box>
      </Container>
    </Flex>
  );
}
