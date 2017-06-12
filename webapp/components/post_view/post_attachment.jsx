// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import * as TextFormatting from 'utils/text_formatting.jsx';
import {localizeMessage} from 'utils/utils.jsx';

import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';

export default class PostAttachment extends React.PureComponent {
    static propTypes = {

        /**
         * The attachment to render
         */
        attachment: PropTypes.object.isRequired
    }

    constructor(props) {
        super(props);

        this.getFieldsTable = this.getFieldsTable.bind(this);
        this.getInitState = this.getInitState.bind(this);
        this.shouldCollapse = this.shouldCollapse.bind(this);
        this.toggleCollapseState = this.toggleCollapseState.bind(this);
    }

    componentDidMount() {
        $(this.refs.attachment).on('click', '.attachment-link-more', this.toggleCollapseState);
    }

    componentWillUnmount() {
        $(this.refs.attachment).off('click', '.attachment-link-more', this.toggleCollapseState);
    }

    componentWillMount() {
        this.setState(this.getInitState());
    }

    getInitState() {
        const shouldCollapse = this.shouldCollapse();
        const text = TextFormatting.formatText(this.props.attachment.text || '');
        const uncollapsedText = text + (shouldCollapse ? `<div><a class="attachment-link-more" href="#">${localizeMessage('post_attachment.collapse', 'Show less...')}</a></div>` : '');
        const collapsedText = shouldCollapse ? this.getCollapsedText() : text;

        return {
            shouldCollapse,
            collapsedText,
            uncollapsedText,
            text: shouldCollapse ? collapsedText : uncollapsedText,
            collapsed: shouldCollapse
        };
    }

    toggleCollapseState(e) {
        e.preventDefault();

        this.setState({
            text: this.state.collapsed ? this.state.uncollapsedText : this.state.collapsedText,
            collapsed: !this.state.collapsed
        });
    }

    shouldCollapse() {
        const text = this.props.attachment.text || '';
        return (text.match(/\n/g) || []).length >= 5 || text.length > 700;
    }

    getCollapsedText() {
        let text = this.props.attachment.text || '';
        if ((text.match(/\n/g) || []).length >= 5) {
            text = text.split('\n').splice(0, 5).join('\n');
        } else if (text.length > 700) {
            text = text.substr(0, 700);
        }

        return TextFormatting.formatText(text) + `<div><a class="attachment-link-more" href="#">${localizeMessage('post_attachment.more', 'Show more...')}</a></div>`;
    }

    getFieldsTable() {
        const fields = this.props.attachment.fields;
        if (!fields || !fields.length) {
            return '';
        }

        const fieldTables = [];

        let headerCols = [];
        let bodyCols = [];
        let rowPos = 0;
        let lastWasLong = false;
        let nrTables = 0;

        fields.forEach((field, i) => {
            if (rowPos === 2 || !(field.short === true) || lastWasLong) {
                fieldTables.push(
                    <table
                        className='attachment-fields'
                        key={'attachment__table__' + nrTables}
                    >
                        <thead>
                            <tr>
                                {headerCols}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {bodyCols}
                            </tr>
                        </tbody>
                    </table>
                );
                headerCols = [];
                bodyCols = [];
                rowPos = 0;
                nrTables += 1;
                lastWasLong = false;
            }
            headerCols.push(
                <th
                    className='attachment-field__caption'
                    key={'attachment__field-caption-' + i + '__' + nrTables}
                    width='50%'
                >
                    {field.title}
                </th>
            );
            bodyCols.push(
                <td
                    className='attachment-field'
                    key={'attachment__field-' + i + '__' + nrTables}
                    dangerouslySetInnerHTML={{__html: TextFormatting.formatText(field.value || '')}}
                />
            );
            rowPos += 1;
            lastWasLong = !(field.short === true);
        });
        if (headerCols.length > 0) { // Flush last fields
            fieldTables.push(
                <table
                    className='attachment-fields'
                    key={'attachment__table__' + nrTables}
                >
                    <thead>
                        <tr>
                            {headerCols}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {bodyCols}
                        </tr>
                    </tbody>
                </table>
            );
        }
        return (
            <div>
                {fieldTables}
            </div>
        );
    }

    render() {
        const data = this.props.attachment;

        let preText;
        if (data.pretext) {
            preText = (
                <div
                    className='attachment__thumb-pretext'
                    dangerouslySetInnerHTML={{__html: TextFormatting.formatText(data.pretext)}}
                />
            );
        }

        let author = [];
        if (data.author_name || data.author_icon) {
            if (data.author_icon) {
                author.push(
                    <img
                        className='attachment__author-icon'
                        src={data.author_icon}
                        key={'attachment__author-icon'}
                        height='14'
                        width='14'
                    />
                );
            }
            if (data.author_name) {
                author.push(
                    <span
                        className='attachment__author-name'
                        key={'attachment__author-name'}
                    >
                        {data.author_name}
                    </span>
                );
            }
        }
        if (data.author_link) {
            author = (
                <a
                    href={data.author_link}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    {author}
                </a>
            );
        }

        let title;
        if (data.title) {
            if (data.title_link) {
                title = (
                    <h1
                        className='attachment__title'
                    >
                        <a
                            className='attachment__title-link'
                            href={data.title_link}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            {data.title}
                        </a>
                    </h1>
                );
            } else {
                title = (
                    <h1
                        className='attachment__title'
                    >
                        {data.title}
                    </h1>
                );
            }
        }

        let text;
        if (data.text) {
            text = (
                <div
                    className='attachment__text'
                    dangerouslySetInnerHTML={{__html: this.state.text}}
                />
            );
        }

        let image;
        if (data.image_url) {
            image = (
                <img
                    className='attachment__image'
                    src={data.image_url}
                />
            );
        }

        let thumb;
        if (data.thumb_url) {
            thumb = (
                <div
                    className='attachment__thumb-container'
                >
                    <img
                        src={data.thumb_url}
                    />
                </div>
            );
        }

        const fields = this.getFieldsTable();

        let useBorderStyle;
        if (data.color && data.color[0] === '#') {
            useBorderStyle = {borderLeftColor: data.color};
        }

        return (
            <div
                className='attachment'
                ref='attachment'
            >
                {preText}
                <div className='attachment__content'>
                    <div
                        className={useBorderStyle ? 'clearfix attachment__container' : 'clearfix attachment__container attachment__container--' + data.color}
                        style={useBorderStyle}
                    >
                        {author}
                        {title}
                        <div>
                            <div
                                className={thumb ? 'attachment__body' : 'attachment__body attachment__body--no_thumb'}
                            >
                                {text}
                                {image}
                                {fields}
                            </div>
                            {thumb}
                            <div style={{clear: 'both'}}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
