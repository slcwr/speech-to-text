/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
};

export type Query = {
  __typename?: 'Query';
  me: User;
  user?: Maybe<User>;
};

export type QueryUserArgs = {
  id: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type UserFieldsFragment = { 
  __typename?: 'User', 
  id: string, 
  email: string, 
  name?: string | null, 
  role: string, 
  isActive: boolean, 
  lastLoginAt?: string | null, 
  createdAt: string, 
  updatedAt: string 
} & { ' $fragmentName'?: 'UserFieldsFragment' };

export type UserBasicFieldsFragment = { 
  __typename?: 'User', 
  id: string, 
  email: string, 
  name?: string | null, 
  role: string 
} & { ' $fragmentName'?: 'UserBasicFieldsFragment' };

// GetCurrentUser query types
export interface GetCurrentUserQueryData {
  me: User;
}

export const UserFieldsFragmentDoc = {
  "kind": "Document",
  "definitions": [{
    "kind": "FragmentDefinition",
    "name": {"kind": "Name", "value": "UserFields"},
    "typeCondition": {"kind": "NamedType", "name": {"kind": "Name", "value": "User"}},
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [
        {"kind": "Field", "name": {"kind": "Name", "value": "id"}},
        {"kind": "Field", "name": {"kind": "Name", "value": "email"}},
        {"kind": "Field", "name": {"kind": "Name", "value": "name"}},
        {"kind": "Field", "name": {"kind": "Name", "value": "role"}},
        {"kind": "Field", "name": {"kind": "Name", "value": "isActive"}},
        {"kind": "Field", "name": {"kind": "Name", "value": "lastLoginAt"}},
        {"kind": "Field", "name": {"kind": "Name", "value": "createdAt"}},
        {"kind": "Field", "name": {"kind": "Name", "value": "updatedAt"}}
      ]
    }
  }]
} as unknown as DocumentNode<UserFieldsFragment, unknown>;

export const UserBasicFieldsFragmentDoc = {
  "kind": "Document",
  "definitions": [{
    "kind": "FragmentDefinition",
    "name": {"kind": "Name", "value": "UserBasicFields"},
    "typeCondition": {"kind": "NamedType", "name": {"kind": "Name", "value": "User"}},
    "selectionSet": {
      "kind": "SelectionSet",
      "selections": [
        {"kind": "Field", "name": {"kind": "Name", "value": "id"}},
        {"kind": "Field", "name": {"kind": "Name", "value": "email"}},
        {"kind": "Field", "name": {"kind": "Name", "value": "name"}},
        {"kind": "Field", "name": {"kind": "Name", "value": "role"}}
      ]
    }
  }]
} as unknown as DocumentNode<UserBasicFieldsFragment, unknown>;