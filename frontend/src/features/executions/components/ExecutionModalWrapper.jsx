import { useParams, useNavigate } from "react-router-dom";
import ExecutionModal from "./ExecutionModal";

// ExecutionModalWrapper: Reads route params and passes modal close behavior through navigation.
function ExecutionModalWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();

  // handleClose: Closes the current modal by navigating back to the previous route.
  const handleClose = () => {
    navigate(-1);
  };

  return <ExecutionModal jobId={id} onClose={handleClose} />;
}

export default ExecutionModalWrapper;
