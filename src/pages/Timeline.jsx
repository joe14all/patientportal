import TreatmentTimeline from '../components/clinical/TreatmentTimeline';
import styles from './Timeline.module.css';

const Timeline = () => {
  return (
    <div className={styles.timelinePage}>
      <TreatmentTimeline />
    </div>
  );
};

export default Timeline;
