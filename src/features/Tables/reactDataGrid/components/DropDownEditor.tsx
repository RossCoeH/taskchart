// import { textEditorClassname } from '../../../../src/editors/TextEditor';
import type { Task } from '../../../seq/seqTypes';

type DropDownEditorProps = {
  row: Task;
  onRowChange: (row: Task, commit: boolean) => void;
};

const titles = ['Dr.', 'Mr.', 'Mrs.', 'Miss', 'Ms.'] as const;

export default function DropDownEditor({ row, onRowChange }: DropDownEditorProps) {
  return (
    <select
      className={'TextEditor'}
      value={row.name}
      onChange={(event) => onRowChange({ ...row, name: event.target.value }, true)}
      autoFocus
    >
      {titles.map((title) => (
        <option key={title} value={title}>
          {title}
        </option>
      ))}
    </select>
  );
}