import { useParams, useNavigate } from "react-router-dom";
import JobModal from "./JobModal";

// JobModalWrapper: Connects route parameters to the job modal create or edit flow.
function JobModalWrapper({ defaults }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // handleClose: Closes the current modal by navigating back to the previous route.
  const handleClose = () => {
    navigate(-1);
  };

  return <JobModal jobId={id} defaults={defaults} onClose={handleClose} />;
}

export default JobModalWrapper;
