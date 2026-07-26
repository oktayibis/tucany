import { Box } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { BottomBar } from './components/BottomBar';
import { Checklists } from './components/Checklists';
import { DayDetail } from './components/DayDetail';
import { DayList } from './components/DayList';
import { PorkGuide } from './components/PorkGuide';
import { PrintView } from './components/PrintView';
import { SearchScreen } from './components/SearchScreen';
import { HOME, useRoute } from './hooks/useRoute';
import { TripProvider, useTrip } from './state/TripContext';

function Shell() {
  const { route, go } = useRoute();
  const { isOnTrip, activeDayId } = useTrip();
  const didAutoOpen = useRef(false);

  /**
   * Cold start behaviour the brief asks for: when the family is mid-trip,
   * land straight on today's detail instead of the list. Runs once, only
   * when the app was opened with no hash at all, so it never fights a
   * deliberate navigation back to the list.
   */
  useEffect(() => {
    if (didAutoOpen.current) return;
    didAutoOpen.current = true;
    if (window.location.hash === '' && isOnTrip) {
      go({ name: 'day', dayId: activeDayId });
    }
    // Intentionally empty: this is a one-time cold-start check, not a sync
    // that should re-run when `isOnTrip`/`activeDayId` are recomputed at
    // midnight — that would yank the family back to "today" mid-browse.
  }, []);

  const openDay = (dayId: string) => go({ name: 'day', dayId });

  return (
    <>
      {/* The interactive app and the paper document are mutually exclusive:
          this half disappears when printing, PrintView appears. */}
      <Box _print={{ display: 'none' }}>
        {route.name === 'day' ? (
          <DayDetail dayId={route.dayId} onBack={() => go(HOME)} />
        ) : route.name === 'pork' ? (
          <PorkGuide tab={route.tab} onTabChange={(tab) => go({ name: 'pork', tab })} />
        ) : route.name === 'search' ? (
          <SearchScreen onOpenDay={openDay} />
        ) : route.name === 'lists' ? (
          <Checklists />
        ) : (
          <DayList onOpenDay={openDay} />
        )}
        <BottomBar route={route} onNavigate={go} />
      </Box>
      <PrintView />
    </>
  );
}

export default function App() {
  return (
    <TripProvider>
      <Shell />
    </TripProvider>
  );
}
