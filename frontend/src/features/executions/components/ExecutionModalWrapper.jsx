import { useParams, useNavigate } from "react-router-dom";
import ExecutionModal from "./ExecutionModal";

function ExecutionModalWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  return <ExecutionModal jobId={id} onClose={handleClose} />;
}

export default ExecutionModalWrapper;
