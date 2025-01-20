import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TextInput, Button, Pane } from 'evergreen-ui';
import Storager from '../../../utils/storager';

const NavigationTabContent = ({ onLinksChange }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState([]);

  useEffect(() => {
    Storager.get(['links'], (res) => {
      const links = res.links || [];
      setLinks(links);
      onLinksChange && onLinksChange(links);
    });
  }, []);

  const handleAddLink = (e) => {
    e.preventDefault();
    if (!name || !url) return;

    const newLinks = [...links, { name, url }];
    setLinks(newLinks);
    setName('');
    setUrl('');
    Storager.set({ links: newLinks });
    onLinksChange && onLinksChange(newLinks);
  };

  return (
    <Pane display="flex" flexDirection="column" gap={8} padding={16}>
      <TextInput
        name="name"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="网站名称"
      />
      <TextInput
        name="url"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="网站地址"
        type="url"
      />
      <Button appearance="primary" onClick={handleAddLink} width={80}>
        添加
      </Button>
    </Pane>
  );
};

NavigationTabContent.propTypes = {
  onLinksChange: PropTypes.func,
};

export default NavigationTabContent;