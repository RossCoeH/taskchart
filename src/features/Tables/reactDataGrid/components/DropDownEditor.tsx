// import { textEditorClassname } from '../../../../src/editors/TextEditor';
import type { EditorProps } from 'react-data-grid/lib/index';
import type { Task } from '../../../seq/seqTypes';

const titles = ['Dr.', 'Mr.', 'Mrs.', 'Miss', 'Ms.'] as const;

export default function DropDownEditor({ row, onRowChange }: EditorProps<Task>) {
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