import { useParams, useNavigate } from "react-router-dom";
import JobModal from "./JobModal";

function JobModalWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <JobModal
      jobId={id}
      onClose={handleClose}
    />
  );
}

export default JobModalWrapper;