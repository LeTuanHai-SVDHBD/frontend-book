/** Route composition only; design state, reusable controls and business screens live in separate modules. */
import DemoProvider, { useDemo } from "./demo/DemoProvider";
import Shell from "./components/Shell";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import AuctionDetail from "./pages/AuctionDetail";
import ListingForm from "./pages/ListingForm";
import Listings, { ListingDetail } from "./pages/Listings";
import Transactions, { TradeDetail } from "./pages/Transactions";
import Complaints, { ComplaintDetail } from "./pages/Complaints";
import Account from "./pages/Account";
import Admin, { SystemPage } from "./pages/Admin";
import { useRoute } from "./lib/router";
function Application() {
  const route = useRoute(),
    { state } = useDemo();
  let page;
  switch (route.page) {
    case "home":
      page = <Home />;
      break;
    case "catalog":
      page = <Catalog />;
      break;
    case "auction":
      page = <AuctionDetail id={route.id} />;
      break;
    case "mine":
      page = <Listings />;
      break;
    case "create":
      page = <ListingForm />;
      break;
    case "edit":
      page = <ListingForm sourceId={route.id} mode="edit" />;
      break;
    case "relist":
      page = <ListingForm sourceId={route.id} mode="relist" />;
      break;
    case "listing":
      page = <ListingDetail id={route.id} />;
      break;
    case "trades":
      page = <Transactions />;
      break;
    case "trade":
      page = <TradeDetail id={route.id} />;
      break;
    case "complaints":
    case "admin-complaints":
      page = <Complaints />;
      break;
    case "complaint":
      page = <ComplaintDetail id={route.id} />;
      break;
    case "account":
      page = <Account />;
      break;
    case "moderation":
      page = <Admin />;
      break;
    case "system":
      page = <SystemPage />;
      break;
  }
  return (
    <Shell route={route}>
      <div
        key={`${state.viewer}-${route.page}-${"id" in route ? route.id : ""}`}
      >
        {page}
      </div>
    </Shell>
  );
}
export default function App() {
  return (
    <DemoProvider>
      <Application />
    </DemoProvider>
  );
}
