import { useEffect, useRef } from 'react';
import { BottomBar } from './components/BottomBar';
import { Checklists } from './components/Checklists';
import { DayPager } from './components/DayPager';
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
      {/*
       * The app is one fixed-height phone column, not a scrolling page: the
       * frame owns the viewport height and every screen scrolls *inside* it.
       * That is what lets the day pager's header, its swipe track and the two
       * bottom bars all be plain `flex-none`/`flex-1` siblings — the previous
       * page-scroll model needed `position: fixed` bars and a hand-maintained
       * 61px offset between them, which drifted the moment BottomBar resized.
       * On a desktop the column is centred on the muted page behind it.
       */}
      <div className="flex justify-center print:hidden">
        <div className="relative flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden bg-bg">
          {route.name === 'day' ? (
            <DayPager
              dayId={route.dayId}
              onBack={() => go(HOME)}
              onDayChange={(dayId) => go({ name: 'day', dayId })}
            />
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
        </div>
      </div>
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
