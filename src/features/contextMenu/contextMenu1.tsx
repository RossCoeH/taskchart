import useContextMenu from './useContextmenu'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import fas from '@fortawesome/free-solid-svg-icons'


const Menu = () => {
  const { anchorPoint, show } = useContextMenu();

  if (show) {
    return (
      <ul className="menu" style={{ top: anchorPoint.y ,left: anchorPoint.x }}>
        <li className="menu__list">
         <FontAwesomeIcon icon={fas.faShare} fontSize={20}   className="menu__icons" />
          Share
        </li>
        <li className="menu__list">
          <FontAwesomeIcon icon= {fas.faCut}  fontSize={20} className="menu__icons" />
          Cut
        </li>
        <li className="menu__list">
         <FontAwesomeIcon icon={fas.faCopy} fontSize={20} className="menu__icons" />
          Copy to
        </li>
        <li className="menu__list">
          <FontAwesomeIcon icon={fas.faDownload} fontSize={20} className="menu__icons" />
          Download
        </li>
        <hr />
        <li className="menu__list">
          <FontAwesomeIcon icon={fas.faDownload}  fontSize={20} className="menu__icons" />
          Refresh
        </li>
        <li className="menu__list">
          {/* <FontAwesomeIcon icon={fas.faTrash} fontSize={20} className="menu__icons" /> */}
          Delete
        </li>
      </ul>
    );
  }
  return <></>;
};

export default Menu;