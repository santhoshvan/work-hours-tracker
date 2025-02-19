"use client";
import { useState, useEffect } from "react";
import { openDB } from "idb";
import {
  Box,
  Heading,
  VStack,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Text,
  Container,
  IconButton,
  Button,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

// ✅ Initialize IndexedDB with user-specific data
const dbPromise = openDB("workHoursDB", 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      db.createObjectStore("entries", { keyPath: "id" });
    }
    if (oldVersion < 2) {
      db.createObjectStore("users", { keyPath: "username" });
    }
  },
});

// ✅ Fetch work hours from IndexedDB
async function getHours(username, year, month) {
  const db = await dbPromise;
  const user = await db.get("users", username);
  return user?.hours?.[`${year}-${month}`] || {};
}

// ✅ Save work hours to IndexedDB
async function saveHours(username, year, month, hours) {
  const db = await dbPromise;
  const user = (await db.get("users", username)) || { username, hours: {} };
  user.hours[`${year}-${month}`] = hours;
  await db.put("users", user);
}

// ✅ Generate Calendar Structure
function generateCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let week = new Array(firstDay).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

export default function WorkHoursTracker() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [hours, setHours] = useState({});
  const weeks = generateCalendar(year, month);

  // ✅ Load stored username once
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      setIsLoggedIn(true);
    }
  }, []);

  // ✅ Fetch hours when username, year, or month changes
  useEffect(() => {
    if (username) {
      getHours(username, year, month).then(setHours);
    }
  }, [username, year, month]);

  // ✅ Handle User Login
  const handleLogin = async () => {
    if (!username.trim()) return;
    setIsLoggedIn(true);
    localStorage.setItem("username", username);
    const userHours = await getHours(username, year, month);
    setHours(userHours);
  };

  // ✅ Handle User Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setHours({});
    localStorage.removeItem("username");
  };

  // ✅ Handle Input Changes and Save to IndexedDB
  const handleInputChange = async (day, index, event) => {
    if (index === 0 || index === 6) return; // Skip weekends
    const newHours = { ...hours, [`${year}-${month}-${day}`]: event.target.value };
    setHours(newHours);
    await saveHours(username, year, month, newHours);
  };

  // ✅ Calculate Weekly Hours (excluding weekends)
  const getWeeklyHours = () => {
    return weeks.map((week) =>
      week.reduce((total, day, index) =>
        index === 0 || index === 6 ? total : total + (day ? Number(hours[`${year}-${month}-${day}`] || 0) : 0), 0)
    );
  };

  // ✅ Calculate Monthly Total Hours (excluding weekends)
  const getTotalHours = () =>
    Object.entries(hours)
      .filter(([key]) => {
        const date = new Date(year, month, key.split("-")[2]);
        return date.getDay() !== 0 && date.getDay() !== 6;
      })
      .map(([_, h]) => Number(h))
      .reduce((acc, h) => acc + h, 0);

  // ✅ Change Month
  const changeMonth = (offset) => {
    setMonth((prev) => {
      let newMonth = prev + offset;
      let newYear = year;
      if (newMonth < 0) {
        newYear -= 1;
        newMonth = 11;
      } else if (newMonth > 11) {
        newYear += 1;
        newMonth = 0;
      }
      setYear(newYear);
      return newMonth;
    });
  };

  const weeklyHours = getWeeklyHours();

  return (
    <Flex justify="center" align="center" minH="100vh" bg="gray.50">
      <Container maxW="800px" py="8">
        <Box p="6" bg="white" rounded="md" shadow="md" border="1px solid" borderColor="gray.300">
          {!isLoggedIn ? (
            <VStack spacing="4" mb="6">
              <Heading textAlign="center" fontSize="xl">Enter Your Name</Heading>
              <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your Name" size="lg" focusBorderColor="blue.500" />
              <Button colorScheme="blue" size="lg" onClick={handleLogin}>Start Tracking</Button>
            </VStack>
          ) : (
            <>
              <Flex justify="space-between" align="center" mb="4">
                <Heading fontSize="lg">Hello, {username}</Heading>
                <Button colorScheme="red" size="sm" onClick={handleLogout}>Logout</Button>
              </Flex>

              <Flex justify="space-between" align="center" mb="4">
                <IconButton icon={<ChevronLeftIcon />} onClick={() => changeMonth(-1)} size="md" />
                <Heading textAlign="center" fontSize="lg">
                  {new Date(year, month).toLocaleString("default", { month: "long" })} {year}
                </Heading>
                <IconButton icon={<ChevronRightIcon />} onClick={() => changeMonth(1)} size="md" />
              </Flex>

              {/* Calendar */}
              <Table variant="simple" colorScheme="gray">
                <Thead bg="gray.100">
                  <Tr>
                    <Th>Sun</Th>
                    <Th>Mon</Th>
                    <Th>Tue</Th>
                    <Th>Wed</Th>
                    <Th>Thu</Th>
                    <Th>Fri</Th>
                    <Th>Sat</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {weeks.map((week, i) => (
                    <Tr key={i}>
                      {week.map((day, index) => (
                        <Td key={index} textAlign="center" bg={index === 0 || index === 6 ? "gray.200" : "white"}>
                          {day && (
                            <>
                              <Text fontSize="sm" fontWeight="bold">{day}</Text>
                              <Input type="number" disabled={index === 0 || index === 6} value={hours[`${year}-${month}-${day}`] || ""} onChange={(e) => handleInputChange(day, index, e)} size="sm" textAlign="center" />
                            </>
                          )}
                        </Td>
                      ))}
                      <Td fontWeight="bold" bg="gray.100">{weeklyHours[i]} hours</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              {/* Monthly Total Hours */}
              <Box mt="4" p="2" bg="gray.100" textAlign="center" fontWeight="bold">
                Total Monthly Hours: {getTotalHours()} hours
              </Box>
            </>
          )}
        </Box>
      </Container>
    </Flex>
  );
}
