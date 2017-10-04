/*
 * SonarQube
 * Copyright (C) 2009-2017 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
// @flow
import React from 'react';
import classNames from 'classnames';
import Step from './Step';
import CloseIcon from '../../../components/icons-components/CloseIcon';
import { generateToken, revokeToken } from '../../../api/user-tokens';
import { translate } from '../../../helpers/l10n';

/*::
type Props = {|
  finished: boolean,
  open: boolean,
  onContinue: (token: string) => void,
  onOpen: () => void,
  stepNumber: number
|};
*/

/*::
type State = {
  existingToken:string,
  loading: boolean,
  selection: string,
  tokenName?: string,
  token?: string
};
*/

export default class TokenStep extends React.PureComponent {
  /*:: mounted: boolean; */
  /*:: props: Props; */
  state /*: State */ = {
    existingToken: '',
    loading: false,
    selection: 'generate'
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getToken = () =>
    this.state.selection === 'generate' ? this.state.token : this.state.existingToken;

  handleTokenNameChange = (event /*: { target: HTMLInputElement } */) => {
    this.setState({ tokenName: event.target.value });
  };

  handleTokenGenerate = (event /*: Event */) => {
    event.preventDefault();
    const { tokenName } = this.state;
    if (tokenName) {
      this.setState({ loading: true });
      generateToken(tokenName).then(
        ({ token }) => {
          if (this.mounted) {
            this.setState({ loading: false, token });
          }
        },
        () => {
          if (this.mounted) {
            this.setState({ loading: false });
          }
        }
      );
    }
  };

  handleTokenRevoke = (event /*: Event */) => {
    event.preventDefault();
    const { tokenName } = this.state;
    if (tokenName) {
      this.setState({ loading: true });
      revokeToken(tokenName).then(
        () => {
          if (this.mounted) {
            this.setState({ loading: false, token: undefined, tokenName: undefined });
          }
        },
        () => {
          if (this.mounted) {
            this.setState({ loading: false });
          }
        }
      );
    }
  };

  handleContinueClick = (event /*: Event */) => {
    event.preventDefault();
    const token = this.getToken();
    if (token) {
      this.props.onContinue(token);
    }
  };

  handleGenerateClick = (event /*: Event */) => {
    event.preventDefault();
    this.setState({ selection: 'generate' });
  };

  handleUseExistingClick = (event /*: Event */) => {
    event.preventDefault();
    this.setState({ selection: 'use-existing' });
  };

  handleExisingTokenChange = (event /*: { currentTarget: HTMLInputElement } */) => {
    this.setState({ existingToken: event.currentTarget.value });
  };

  renderGenerateOption = () => (
    <div>
      <a
        className="js-new link-base-color link-no-underline"
        href="#"
        onClick={this.handleGenerateClick}>
        <i
          className={classNames('icon-radio', 'spacer-right', {
            'is-checked': this.state.selection === 'generate'
          })}
        />
        {translate('onboading.token.generate_token')}
      </a>
      {this.state.selection === 'generate' && (
        <div className="big-spacer-top">
          <form onSubmit={this.handleTokenGenerate}>
            <input
              autoFocus={true}
              className="input-large spacer-right text-middle"
              onChange={this.handleTokenNameChange}
              placeholder={translate('onboading.token.generate_token.placeholder')}
              required={true}
              type="text"
              value={this.state.tokenName || ''}
            />
            {this.state.loading ? (
              <i className="spinner text-middle" />
            ) : (
              <button className="text-middle">{translate('onboarding.token.generate')}</button>
            )}
          </form>
        </div>
      )}
    </div>
  );

  renderUseExistingOption = () => (
    <div className="big-spacer-top">
      <a
        className="js-new link-base-color link-no-underline"
        href="#"
        onClick={this.handleUseExistingClick}>
        <i
          className={classNames('icon-radio', 'spacer-right', {
            'is-checked': this.state.selection === 'use-existing'
          })}
        />
        {translate('onboarding.token.use_existing_token')}
      </a>
      {this.state.selection === 'use-existing' && (
        <div className="big-spacer-top">
          <input
            autoFocus={true}
            className="input-large spacer-right text-middle"
            onChange={this.handleExisingTokenChange}
            placeholder={translate('onboarding.token.use_existing_token.placeholder')}
            required={true}
            type="text"
            value={this.state.existingToken}
          />
        </div>
      )}
    </div>
  );

  renderForm = () => {
    const { existingToken, loading, selection, token, tokenName } = this.state;

    return (
      <div className="boxed-group-inner">
        {token != null ? (
          <form onSubmit={this.handleTokenRevoke}>
            <span className="text-middle">
              {tokenName}
              {': '}
            </span>
            <strong className="spacer-right text-middle">{token}</strong>
            {loading ? (
              <i className="spinner text-middle" />
            ) : (
              <button className="button-clean text-middle" onClick={this.handleTokenRevoke}>
                <CloseIcon className="icon-red" />
              </button>
            )}
          </form>
        ) : (
          <div>
            {this.renderGenerateOption()}
            {this.renderUseExistingOption()}
          </div>
        )}

        <div className="note big-spacer-top width-50">{translate('onboarding.token.text')}</div>

        {((selection === 'generate' && token != null) ||
          (selection === 'use-existing' && existingToken)) && (
          <div className="big-spacer-top">
            <button className="js-continue" onClick={this.handleContinueClick}>
              {translate('continue')}
            </button>
          </div>
        )}
      </div>
    );
  };

  renderResult = () => {
    const { selection, tokenName } = this.state;
    const token = this.getToken();

    if (!token) {
      return null;
    }

    return (
      <div className="boxed-group-actions">
        <i className="icon-check spacer-right" />
        {selection === 'generate' && tokenName && `${tokenName}: `}
        <strong>{token}</strong>
      </div>
    );
  };

  render() {
    return (
      <Step
        finished={this.props.finished}
        onOpen={this.props.onOpen}
        open={this.props.open}
        renderForm={this.renderForm}
        renderResult={this.renderResult}
        stepNumber={this.props.stepNumber}
        stepTitle={translate('onboarding.token.header')}
      />
    );
  }
}
