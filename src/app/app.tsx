import { Anchor, AppShell, Container, Group } from '@mantine/core';
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom';
import { AppProviders } from './providers/app-providers';
import { BookingPage } from '../pages/booking';
import { BookingsPage } from '../pages/bookings';
import { CreateEventTypePage } from '../pages/create-event-type';
import { HomePage } from '../pages/home';

const NAV_LINKS = [
  { to: '/', label: 'Типы событий' },
  { to: '/types/new', label: 'Новый тип' },
  { to: '/bookings', label: 'Брони' },
];

export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppShell header={{ height: 56 }} padding="md">
          <AppShell.Header>
            <Container size="md" h="100%">
              <Group h="100%" justify="space-between">
                <Anchor component={Link} to="/" fw={700} c="inherit" underline="never">
                  Календарь звонков
                </Anchor>
                <Group component="nav" gap="md">
                  {NAV_LINKS.map((link) => (
                    <Anchor
                      key={link.to}
                      component={NavLink}
                      to={link.to}
                      end
                      size="sm"
                      style={({ isActive }: { isActive: boolean }) => ({
                        fontWeight: isActive ? 600 : undefined,
                      })}
                    >
                      {link.label}
                    </Anchor>
                  ))}
                </Group>
              </Group>
            </Container>
          </AppShell.Header>
          <AppShell.Main>
            <Container size="md" py="md">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/types/new" element={<CreateEventTypePage />} />
                <Route path="/booking/:typeId" element={<BookingPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
              </Routes>
            </Container>
          </AppShell.Main>
        </AppShell>
      </BrowserRouter>
    </AppProviders>
  );
}
