import { useContext } from "react";
import { Button } from "./ui/button";
import { CardContext } from "./context/CardContext";

export const ServerActions = () => {
  const cardContext = useContext(CardContext);
  const {
    selectedCards,
    handleDeleteCard,
    handleSingleClick,
    handleSingleAndDoubleClick,
    handleDeselectCard,
    isActive,
    counter,
  } = cardContext;

  return (
    <div className="flex gap-5">
      <Button disabled={!isActive || counter === 0} variant="destructive">
        Delete
      </Button>

      <Button
        variant="secondary"
        className="bg-blue-500"
        onClick={handleDeselectCard}
        disabled={!isActive || counter === 0}
      >
        Unselect
      </Button>
    </div>
  );
};
