import { Outlet } from "react-router-dom";
import { EventProvider } from "../../context/EventContext";

/**
 * StudioLayout boundary:
 * Encapsulates the EventProvider and Firestore dependencies
 * so they are only downloaded and initialized when an authenticated
 * user enters the studio workspace, completely excluding Firestore
 * from the public landing page and authentication screens.
 */
export default function StudioLayout() {
  return (
    <EventProvider>
      <Outlet />
    </EventProvider>
  );
}
