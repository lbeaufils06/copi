import { useParams, useNavigate } from "react-router-dom";
import JobModal from "./JobModal";

function JobModalWrapper({ defaults }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  return <JobModal jobId={id} defaults={defaults} onClose={handleClose} />;
}

export default JobModalWrapper;
